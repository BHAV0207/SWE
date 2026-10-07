import os
import shutil
import tempfile
import unittest

from bhp.file_store import FileForbidden, FileNotFound, FileStore


class FileStoreTest(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.root)
        self.write("index.html", b"home")
        self.write("data.bin", b"0123456789")
        os.mkdir(os.path.join(self.root, "empty-dir"))
        self.store = FileStore(self.root)

    def write(self, name, content):
        with open(os.path.join(self.root, name), "wb") as file:
            file.write(content)

    def read_all(self, path):
        return b"".join(self.store.open(path))

    def test_file_and_query_is_ignored(self):
        self.assertEqual(self.read_all("/data.bin?x=1"), b"0123456789")

    def test_directory_serves_index(self):
        self.assertEqual(self.read_all("/"), b"home")

    def test_missing_and_outside_root(self):
        outside = tempfile.NamedTemporaryFile(delete=False)
        self.addCleanup(os.unlink, outside.name)
        os.symlink(outside.name, os.path.join(self.root, "escape"))
        for path in ["/nope", "/empty-dir/", "/../../etc/passwd", "/escape"]:
            with self.subTest(path=path), self.assertRaises(FileNotFound):
                self.store.open(path)

    @unittest.skipIf(os.geteuid() == 0, "root can read anything")
    def test_unreadable_file_is_forbidden(self):
        self.write("secret", b"x")
        os.chmod(os.path.join(self.root, "secret"), 0)
        with self.assertRaises(FileForbidden):
            self.store.open("/secret")

    def test_sends_exactly_the_size_from_open_time(self):
        file = self.store.open("/data.bin")
        self.write("data.bin", b"0123456789-grew-after-open")  # same inode, now longer
        self.assertEqual(b"".join(file), b"0123456789")  # matches the content-length sent

    def test_file_shrinking_mid_send_is_an_error_and_closes(self):
        file = self.store.open("/data.bin")
        with open(os.path.join(self.root, "data.bin"), "r+b") as handle:
            handle.truncate(3)
        with self.assertRaises(OSError):
            b"".join(file)
        self.assertTrue(file._file.closed)


if __name__ == "__main__":
    unittest.main()
